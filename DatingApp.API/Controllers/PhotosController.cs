using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/Photos")]
    [ApiController]
    public class PhotosController: ControllerBase
    {
        private IDatingRepository _repo { get; }
        private IMapper _mapper { get; }
        private IOptions<CloudinarySettings> _cloudinaryConfig { get; }
        private Cloudinary _cloudinary;
        public PhotosController(IDatingRepository repo,
                                IMapper mapper,
                                IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _repo = repo;
            _mapper = mapper;
            _cloudinaryConfig = cloudinaryConfig;

            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret

            );
            _cloudinary = new Cloudinary(acc);
        }
        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id){
            
            var photoFromRepo = await _repo.GetPhoto(id);

            var photo = _mapper.Map<PhotoForReturnedDto>(photoFromRepo);
           
            return Ok(photo);

        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id){
              
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await _repo.GetUser(userId);
            if(!user.Photos.Any(p => p.Id == id))
                return Unauthorized();
            
            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.IsMain)
                return BadRequest("You cannot delete your main photo");

            if(photoFromRepo.PublicId != null){
                 var deleteParams = new DeletionParams(photoFromRepo.PublicId);

                var result = _cloudinary.Destroy(deleteParams);

                if(result.Result == "ok"){
                    _repo.Delete(photoFromRepo);
                }    
            }
            if(photoFromRepo.PublicId == null){
                 _repo.Delete(photoFromRepo);
            }

            if(await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed to delete the photo");
        }
        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId,
            [FromForm]PhotoForCreationDto photo)
        {
            
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var file = photo.File;
            var userFromRepo = await _repo.GetUser(userId);

            var uploadResult = new ImageUploadResult();
            if(file.Length >0){
                using (var stream = file.OpenReadStream()){
                    var uploadParams = new ImageUploadParams(){
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500)
                        .Crop("fill").Gravity("face")
                    };
                   
                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }
            photo.Url = uploadResult.Uri.ToString();
            photo.PublicId = uploadResult.PublicId;
            var cloudinaryPhoto = _mapper.Map<Photo>(photo);
           
            if(!userFromRepo.Photos.Any(u => u.IsMain))
                cloudinaryPhoto.IsMain = true;

            userFromRepo.Photos.Add(cloudinaryPhoto);

            if (await _repo.SaveAll()){
        
               var photoToReturn = _mapper.Map<PhotoForReturnedDto>(cloudinaryPhoto);
                return CreatedAtRoute("GetPhoto", new {id = cloudinaryPhoto.Id, userId = userId}, photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }
        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMain(int userId, int id){
            
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var user = await _repo.GetUser(userId);
            if(!user.Photos.Any(p => p.Id == id))
                return Unauthorized();
            
            var photoFromRepo = await _repo.GetPhoto(id);

            if(photoFromRepo.IsMain)
                return BadRequest("This is already the main photo");

            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
             currentMainPhoto.IsMain = false;

             photoFromRepo.IsMain = true;

             if (await _repo.SaveAll())
                return NoContent();

            return BadRequest("could not set photo to main");
        }
    }
}

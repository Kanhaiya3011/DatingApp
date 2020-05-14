using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        public IDatingRepository _repo { get; }
        public IMapper _mapper { get; }
        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;

        }
        [HttpGet]
        public async Task<IActionResult> GetUsers(){
            
            var users = await _repo.GetUsers();
            var userForDto = _mapper.Map<IList<UserForListDto>>(users);
            return Ok(userForDto);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id){
        
            var user = await _repo.GetUser(id);
            var userForDetailedDto = _mapper.Map<UserForDetailedDto>(user);
            return Ok(userForDetailedDto);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto user)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var userFromRepo = await _repo.GetUser(id);

            _mapper.Map(user, userFromRepo);

            if (await _repo.SaveAll())
                return NoContent();

            throw new System.Exception($"Updating user {id} failed on save");
        }
    }
}
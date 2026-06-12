using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;

namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService) => _userService = userService;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserProfile(int id)
    {
        var user = await _userService.GetUserWithRoleAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(new
        {
            id = user.UserId,
            name = user.Username,
            email = user.Email,
            phone = user.Phone,
            role = user.Role?.RoleName ?? "User"
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UserUpdateDto dto)
    {
        var (success, message, user) = await _userService.UpdateUserProfileAsync(
            id, dto.Name, dto.Email, dto.Phone, dto.NewPassword);

        if (!success)
        {
            return message == "User not found." ? NotFound(new { message }) : BadRequest(new { message });
        }

        return Ok(new
        {
            id = user!.UserId,
            name = user.Username,
            email = user.Email,
            phone = user.Phone,
            message = "Profile updated successfully!"
        });
    }
}

public class UserUpdateDto
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? NewPassword { get; set; }
}
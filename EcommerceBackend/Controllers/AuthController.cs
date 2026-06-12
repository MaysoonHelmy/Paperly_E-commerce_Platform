using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;

namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService) => _authService = authService;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var (success, message) = await _authService.RegisterAsync(request.Name, request.Email, request.Password);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var (success, message, userData) = await _authService.LoginAsync(request.Email, request.Password);
        return success ? Ok(userData) : Unauthorized(new { message });
    }
}

public class LoginDto { public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
public class RegisterDto { public string Name { get; set; } = ""; public string Email { get; set; } = ""; public string Password { get; set; } = ""; }
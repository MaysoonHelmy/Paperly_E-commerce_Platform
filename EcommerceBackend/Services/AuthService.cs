using EcommerceBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBackend.Services;

public class AuthService
{
    private readonly EcommerceDbContext _context;

    public AuthService(EcommerceDbContext context) => _context = context;

    public async Task<(bool success, string message)> RegisterAsync(string name, string email, string password)
    {
        if (await _context.Users.AnyAsync(u => u.Email == email))
            return (false, "Email already registered.");

        var newUser = new User
        {
            Username = name,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = 2
        };
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
        return (true, "Registration successful!");
    }

    public async Task<(bool success, string message, object? userData)> LoginAsync(string email, string password)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return (false, "Invalid email or password.", null);

        if (user.PasswordHash == password)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            await _context.SaveChangesAsync();
        }
        else if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return (false, "Invalid email or password.", null);
        }

        var userData = new
        {
            userId = user.UserId,
            name = user.Username,
            email = user.Email,
            role = user.Role?.RoleName ?? "User"
        };
        return (true, "Login successful", userData);
    }
}
using EcommerceBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBackend.Services;

public class UserService
{
    private readonly EcommerceDbContext _context;

    public UserService(EcommerceDbContext context) => _context = context;

    public async Task<User?> GetUserWithRoleAsync(int id)
        => await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == id);

    public async Task<(bool success, string message, User? user)> UpdateUserProfileAsync(
        int id, string name, string email, string? phone, string? newPassword)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return (false, "User not found.", null);

        if (user.Email != email && await _context.Users.AnyAsync(u => u.Email == email))
            return (false, "Email address is already in use.", null);

        user.Username = name;
        user.Email = email;
        user.Phone = phone;

        if (!string.IsNullOrWhiteSpace(newPassword))
        {
            if (newPassword.Length < 6)
                return (false, "Password must be at least 6 characters.", null);
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        }

        await _context.SaveChangesAsync();
        return (true, "Profile updated successfully!", user);
    }
}
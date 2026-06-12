using EcommerceBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBackend.Services;

public class AddressService
{
    private readonly EcommerceDbContext _context;

    public AddressService(EcommerceDbContext context) => _context = context;

    public async Task<List<Address>> GetUserAddressesAsync(int userId)
        => await _context.Addresses.Where(a => a.UserId == userId).ToListAsync();

    public async Task<Address?> GetAddressByIdAsync(int id)
        => await _context.Addresses.FindAsync(id);

    public async Task<Address> CreateAddressAsync(int userId, string addressLine, string city, string? postalCode)
    {
        var address = new Address
        {
            UserId = userId,
            AddressLine = addressLine,
            City = city,
            PostalCode = postalCode
        };
        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();
        return address;
    }

    public async Task<Address?> UpdateAddressAsync(int id, string addressLine, string city, string? postalCode)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return null;

        address.AddressLine = addressLine;
        address.City = city;
        address.PostalCode = postalCode;
        await _context.SaveChangesAsync();
        return address;
    }

    public async Task<(bool success, string message)> DeleteAddressAsync(int id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return (false, "Address not found.");

        var hasOrders = await _context.Orders.AnyAsync(o => o.AddressId == id);
        if (hasOrders)
            return (false, "Cannot delete address because it is used in existing orders.");

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return (true, "Address deleted successfully.");
    }
}
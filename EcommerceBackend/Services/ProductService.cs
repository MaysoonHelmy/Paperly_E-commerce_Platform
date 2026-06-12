using EcommerceBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBackend.Services;

public class ProductService
{
    private readonly EcommerceDbContext _context;

    public ProductService(EcommerceDbContext context) => _context = context;

    public async Task<List<Product>> GetAllProductsAsync()
        => await _context.Products.ToListAsync();

    public async Task<Product> CreateProductAsync(string productName, decimal price, int categoryId, int stockQuantity)
    {
        var product = new Product
        {
            ProductName = productName,
            Price = price,
            CategoryId = categoryId,
            StockQuantity = stockQuantity
        };
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product?> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return null;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return product;
    }
}
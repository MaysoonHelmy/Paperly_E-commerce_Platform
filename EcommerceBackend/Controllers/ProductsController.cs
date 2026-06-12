using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;
using EcommerceBackend.Models;

namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;

    public ProductsController(ProductService productService) => _productService = productService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        => Ok(await _productService.GetAllProductsAsync());

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct([FromBody] ProductCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.ProductName))
            return BadRequest(new { message = "Product name is required." });
        if (dto.Price <= 0)
            return BadRequest(new { message = "Price must be greater than zero." });
        if (dto.StockQuantity < 0)
            return BadRequest(new { message = "Stock quantity cannot be negative." });

        var product = await _productService.CreateProductAsync(dto.ProductName, dto.Price, dto.CategoryId, dto.StockQuantity);
        return Ok(new
        {
            productId = product.ProductId,
            productName = product.ProductName,
            price = product.Price,
            categoryId = product.CategoryId,
            stockQuantity = product.StockQuantity
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _productService.DeleteProductAsync(id);
        return product == null ? NotFound(new { message = "Product not found." }) : Ok(new { message = "Product deleted successfully." });
    }
}

public class ProductCreateDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public int StockQuantity { get; set; }
}
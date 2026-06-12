using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;
using EcommerceBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoriesController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        try
        {
            var categories = await _categoryService.GetAllCategoriesAsync();

            if (categories == null || categories.Count == 0)
            {
                return Ok(new List<Category>());
            }

            return Ok(categories);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetCategories: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while retrieving categories." });
        }
    }
}
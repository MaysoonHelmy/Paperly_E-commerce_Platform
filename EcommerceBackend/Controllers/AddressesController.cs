using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;
using EcommerceBackend.Models;

namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AddressesController : ControllerBase
{
    private readonly AddressService _addressService;

    public AddressesController(AddressService addressService) => _addressService = addressService;

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Address>>> GetUserAddresses(int userId)
        => Ok(await _addressService.GetUserAddressesAsync(userId));

    [HttpGet("{id}")]
    public async Task<ActionResult<Address>> GetAddress(int id)
    {
        var address = await _addressService.GetAddressByIdAsync(id);
        return address == null ? NotFound(new { message = "Address not found." }) : Ok(address);
    }

    [HttpPost]
    public async Task<ActionResult<Address>> PostAddress([FromBody] AddressCreateDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.AddressLine) || string.IsNullOrWhiteSpace(dto.City))
            return BadRequest(new { message = "Address line and city are required." });

        var address = await _addressService.CreateAddressAsync(dto.UserId, dto.AddressLine, dto.City, dto.PostalCode);
        return Ok(address);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddressUpdateDto dto)
    {
        var address = await _addressService.UpdateAddressAsync(id, dto.AddressLine, dto.City, dto.PostalCode);
        return address == null ? NotFound(new { message = "Address not found." }) : Ok(address);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var (success, message) = await _addressService.DeleteAddressAsync(id);
        if (!success)
            return message == "Address not found." ? NotFound(new { message }) : BadRequest(new { message });
        return Ok(new { message });
    }
}

public class AddressCreateDto
{
    public int UserId { get; set; }
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
}

public class AddressUpdateDto
{
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
}
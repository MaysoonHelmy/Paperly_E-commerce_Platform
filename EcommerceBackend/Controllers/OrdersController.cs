using Microsoft.AspNetCore.Mvc;
using EcommerceBackend.Services;
using EcommerceBackend.Models;
namespace EcommerceBackend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly OrderService _orderService;

    public OrdersController(OrderService orderService) => _orderService = orderService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllOrders()
        => Ok(await _orderService.GetAllOrdersAsync());

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserOrders(int userId)
        => Ok(await _orderService.GetUserOrdersAsync(userId));

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequest dto)
    {
        try
        {
            var createdOrder = await _orderService.CreateOrderAsync(dto.UserId, dto.AddressId, dto.Items);
            return Ok(createdOrder);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{orderId}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] StatusUpdateDto dto)
    {
        var updatedOrder = await _orderService.UpdateOrderStatusAsync(orderId, dto.StatusId);
        return updatedOrder == null ? NotFound(new { message = "Order not found." }) : Ok(updatedOrder);
    }
}

public class OrderRequest
{
    public int UserId { get; set; }
    public int AddressId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class StatusUpdateDto
{
    public int StatusId { get; set; }
}
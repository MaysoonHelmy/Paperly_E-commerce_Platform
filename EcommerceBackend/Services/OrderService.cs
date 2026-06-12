using EcommerceBackend.Models;
using EcommerceBackend.Controllers;   
using Microsoft.EntityFrameworkCore;

namespace EcommerceBackend.Services;

public class OrderListDto
{
    public int OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public AddressDto? Address { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
    public decimal Total { get; set; }
}

public class CreatedOrderDto
{
    public int OrderId { get; set; }
    public DateTime? OrderDate { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public List<OrderItemResponseDto> Items { get; set; } = new();
    public decimal Total { get; set; }
}

public class OrderItemResponseDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class AddressDto
{
    public string? AddressLine { get; set; }
    public string? City { get; set; }
}

public class OrderStatusDto
{
    public int OrderId { get; set; }
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
}

public class OrderService
{
    private readonly EcommerceDbContext _context;

    public OrderService(EcommerceDbContext context) => _context = context;

    public async Task<List<OrderListDto>> GetAllOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.Orderitems).ThenInclude(oi => oi.Product)
            .Include(o => o.Address)
            .Include(o => o.Status)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderListDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                StatusId = o.StatusId,
                StatusName = o.Status != null ? o.Status.StatusName : "Pending",
                Address = new AddressDto
                {
                    AddressLine = o.Address != null ? o.Address.AddressLine : null,
                    City = o.Address != null ? o.Address.City : null
                },
                Items = o.Orderitems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.ProductName : "Unknown Product",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList(),
                Total = o.Orderitems.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .ToListAsync();
    }

    public async Task<List<OrderListDto>> GetUserOrdersAsync(int userId)
    {
        return await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Orderitems).ThenInclude(oi => oi.Product)
            .Include(o => o.Status)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderListDto
            {
                OrderId = o.OrderId,
                OrderDate = o.OrderDate,
                StatusId = o.StatusId,
                StatusName = o.Status != null ? o.Status.StatusName : "Pending",
                Items = o.Orderitems.Select(oi => new OrderItemResponseDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.ProductName : "Unknown Product",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice
                }).ToList(),
                Total = o.Orderitems.Sum(oi => oi.Quantity * oi.UnitPrice)
            })
            .ToListAsync();
    }

    public async Task<CreatedOrderDto> CreateOrderAsync(int userId, int addressId, List<OrderItemDto> items)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    throw new Exception($"Product {item.ProductId} not found.");
                if (product.StockQuantity < item.Quantity)
                    throw new Exception($"Insufficient stock for {product.ProductName}. Available: {product.StockQuantity}");
                product.StockQuantity -= item.Quantity;
                _context.Products.Update(product);
            }

            var order = new Order
            {
                UserId = userId,
                AddressId = addressId,
                StatusId = 1,
                OrderDate = DateTime.Now
            };
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            foreach (var item in items)
            {
                _context.Orderitems.Add(new Orderitem
                {
                    OrderId = order.OrderId,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Price
                });
            }
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            var createdOrder = await _context.Orders
                .Where(o => o.OrderId == order.OrderId)
                .Include(o => o.Orderitems).ThenInclude(oi => oi.Product)
                .Select(o => new CreatedOrderDto
                {
                    OrderId = o.OrderId,
                    OrderDate = o.OrderDate,
                    StatusId = o.StatusId,
                    StatusName = "Pending",
                    Items = o.Orderitems.Select(oi => new OrderItemResponseDto
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.Product.ProductName,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice
                    }).ToList(),
                    Total = o.Orderitems.Sum(oi => oi.Quantity * oi.UnitPrice)
                })
                .FirstOrDefaultAsync();

            return createdOrder!;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderStatusDto?> UpdateOrderStatusAsync(int orderId, int statusId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return null;

        order.StatusId = statusId;
        await _context.SaveChangesAsync();

        return await _context.Orders
            .Where(o => o.OrderId == orderId)
            .Include(o => o.Status)
            .Select(o => new OrderStatusDto
            {
                OrderId = o.OrderId,
                StatusId = o.StatusId,
                StatusName = o.Status != null ? o.Status.StatusName : "Unknown"
            })
            .FirstOrDefaultAsync();
    }
}
using System;
using System.Collections.Generic;

namespace EcommerceBackend.Models;

public partial class Address
{
    public int AddressId { get; set; }

    public int UserId { get; set; }

    public string AddressLine { get; set; } = null!;

    public string City { get; set; } = null!;

    public string? PostalCode { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual User User { get; set; } = null!;
}

using System;
using System.Collections.Generic;

namespace EcommerceBackend.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public DateTime? OrderDate { get; set; }

    public int UserId { get; set; }

    public int StatusId { get; set; }

    public int AddressId { get; set; }

    public virtual Address Address { get; set; } = null!;

    public virtual ICollection<Orderitem> Orderitems { get; set; } = new List<Orderitem>();

    public virtual Orderstatus Status { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}

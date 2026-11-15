import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Supplier } from '../models/Supplier.js';
import { Product } from '../models/Product.js';
import { config } from '../config/env.js';

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding');

    // 1. Seed Admin User
    const existingAdmin = await User.findOne({ email: 'admin@inventory.com' });
    let adminUser;
    if (existingAdmin) {
      console.log('✓ Admin user already exists:', existingAdmin.email);
      adminUser = existingAdmin;
    } else {
      adminUser = await User.create({
        fullName: 'System Administrator',
        email: 'admin@inventory.com',
        password: 'Admin@123456',
        role: 'admin',
        phoneNumber: '+1-555-0100',
      });
      console.log('✓ Admin user created: admin@inventory.com / Admin@123456');
    }

    // 2. Seed Staff User
    const existingStaff = await User.findOne({ email: 'staff@inventory.com' });
    if (existingStaff) {
      console.log('✓ Staff user already exists:', existingStaff.email);
    } else {
      await User.create({
        fullName: 'Alex Morgan',
        email: 'staff@inventory.com',
        password: 'Staff@123456',
        role: 'staff',
        phoneNumber: '+1-555-0101',
      });
      console.log('✓ Staff user created: staff@inventory.com / Staff@123456');
    }

    // 3. Seed Default Categories
    const categoriesData = [
      { categoryName: 'Electronics', description: 'Computing devices, gadgets, and consumer electronics' },
      { categoryName: 'Office Supplies', description: 'Stationery, paper products, and desk accessories' },
      { categoryName: 'Furniture', description: 'Office chairs, desks, cabinets, and storage units' },
      { categoryName: 'Networking', description: 'Routers, switches, patch cables, and access points' },
      { categoryName: 'Packaging & Shipping', description: 'Boxes, bubble wrap, tape, and mailing labels' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let doc = await Category.findOne({ categoryName: cat.categoryName });
      if (!doc) {
        doc = await Category.create(cat);
        console.log(`✓ Created Category: ${cat.categoryName}`);
      }
      categoryMap[cat.categoryName] = doc._id;
    }

    // 4. Seed Default Suppliers
    const suppliersData = [
      {
        supplierName: 'Apex Tech Wholesale',
        contactPerson: 'David Chen',
        email: 'orders@apextech.com',
        phoneNumber: '+1-555-0201',
        companyName: 'Apex Technologies Inc.',
        address: '100 Industrial Parkway, Suite 400, Chicago, IL',
      },
      {
        supplierName: 'Global Office Pro',
        contactPerson: 'Sarah Jenkins',
        email: 'sales@globaloffice.com',
        phoneNumber: '+1-555-0202',
        companyName: 'Global Office Distributors',
        address: '250 Commerce Blvd, Dallas, TX',
      },
      {
        supplierName: 'ErgoDesign Furnishings',
        contactPerson: 'Michael Ross',
        email: 'support@ergodesign.com',
        phoneNumber: '+1-555-0203',
        companyName: 'ErgoDesign Corp.',
        address: '77 Furniture Row, Grand Rapids, MI',
      },
    ];

    const supplierMap = {};
    for (const sup of suppliersData) {
      let doc = await Supplier.findOne({ supplierName: sup.supplierName });
      if (!doc) {
        doc = await Supplier.create(sup);
        console.log(`✓ Created Supplier: ${sup.supplierName}`);
      }
      supplierMap[sup.supplierName] = doc._id;
    }

    // 5. Seed Sample Products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          productName: 'Ergonomic Mesh Chair Pro',
          sku: 'FURN-CHR-001',
          description: 'High-back breathable mesh chair with adjustable lumbar support',
          category: categoryMap['Furniture'],
          supplier: supplierMap['ErgoDesign Furnishings'],
          purchasePrice: 145.0,
          sellingPrice: 289.0,
          quantity: 24,
          minimumStockLevel: 5,
          unit: 'pcs',
        },
        {
          productName: 'Ultra-Wide 34-Inch Curved Monitor',
          sku: 'ELEC-MON-034',
          description: '144Hz IPS display with USB-C 90W power delivery',
          category: categoryMap['Electronics'],
          supplier: supplierMap['Apex Tech Wholesale'],
          purchasePrice: 380.0,
          sellingPrice: 599.0,
          quantity: 12,
          minimumStockLevel: 4,
          unit: 'pcs',
        },
        {
          productName: 'Cat6 Ethernet Cable (1000ft Spool)',
          sku: 'NET-CAB-1000',
          description: 'Solid copper 550MHz UTP bulk cable for gigabit installations',
          category: categoryMap['Networking'],
          supplier: supplierMap['Apex Tech Wholesale'],
          purchasePrice: 65.0,
          sellingPrice: 119.0,
          quantity: 35,
          minimumStockLevel: 8,
          unit: 'spools',
        },
        {
          productName: 'Wireless Mechanical Keyboard',
          sku: 'ELEC-KEY-002',
          description: 'Compact 75% hot-swappable mechanical keyboard with Bluetooth 5.1',
          category: categoryMap['Electronics'],
          supplier: supplierMap['Apex Tech Wholesale'],
          purchasePrice: 42.0,
          sellingPrice: 89.0,
          quantity: 3,
          minimumStockLevel: 10, // LOW STOCK
          unit: 'pcs',
        },
        {
          productName: 'Heavy-Duty Packing Tape (6-Pack)',
          sku: 'PKG-TPE-006',
          description: '2.8 mil commercial grade acrylic adhesive carton sealing tape',
          category: categoryMap['Packaging & Shipping'],
          supplier: supplierMap['Global Office Pro'],
          purchasePrice: 9.5,
          sellingPrice: 19.99,
          quantity: 0, // OUT OF STOCK
          minimumStockLevel: 15,
          unit: 'packs',
        },
      ];

      for (const prod of sampleProducts) {
        await Product.create(prod);
        console.log(`✓ Created Sample Product: ${prod.productName} (${prod.sku})`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();

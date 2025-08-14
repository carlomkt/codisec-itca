import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrador con todos los permisos' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Usuario con permisos limitados' },
  });

  console.log('Roles created', { adminRole, userRole });

  // Create permissions
  const pages = ['agenda', 'eventos', 'actividades', 'oficios', 'informes', 'distritos', 'responsables', 'config/catalog', 'users'];
  const permissions = await Promise.all(
    pages.map(page =>
      prisma.permission.upsert({
        where: { name: `page:${page}` },
        update: {},
        create: { name: `page:${page}`, description: `Acceso a la página de ${page}` },
      })
    )
  );

  console.log('Permissions created', permissions);

  // Assign all permissions to ADMIN role
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });
  const adminPermissions = await Promise.all(
    permissions.map(permission =>
      prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      })
    )
  );

  console.log('Admin permissions assigned', adminPermissions);

  // Create admin user
  const hashedPassword = await bcrypt.hash('ccatter0312', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'codisecadm' },
    update: { password: hashedPassword },
    create: {
      username: 'codisecadm',
      password: hashedPassword,
    },
  });

  console.log('Admin user created', adminUser);

  // Assign ADMIN role to admin user
  await prisma.userRole.deleteMany({ where: { userId: adminUser.id } });
  const adminUserRole = await prisma.userRole.create({
    data: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log('Admin user role assigned', adminUserRole);

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

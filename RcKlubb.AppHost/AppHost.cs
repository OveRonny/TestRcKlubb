var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.RcKlubbApp_Server>("rcklubbapp-server");

builder.Build().Run();

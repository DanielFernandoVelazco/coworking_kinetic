// KineticWorkspace.API.Tests/Usings.cs
global using Xunit;
global using Moq;
global using FluentAssertions;
global using Microsoft.EntityFrameworkCore;
global using Microsoft.Extensions.Logging;
global using AutoMapper;
global using System;
global using System.Collections.Generic;
global using System.Linq;
global using System.Threading.Tasks;

// ✅ REFERENCIAS AL PROYECTO PRINCIPAL
global using KineticWorkspace.API.Models.Entities;
global using KineticWorkspace.API.Models.DTOs.Alerts;
global using KineticWorkspace.API.Models.DTOs.Auth;
global using KineticWorkspace.API.Models.DTOs.Reservations;
global using KineticWorkspace.API.Models.DTOs.Spaces;
global using KineticWorkspace.API.Models.DTOs.Admin;
global using KineticWorkspace.API.Models.DTOs.Amenities;
global using KineticWorkspace.API.Helpers;

// ✅ REFERENCIA A TESTDATAFACTORY
global using KineticWorkspace.API.Tests.Helpers;
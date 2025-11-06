# Multi-stage build for OneMoreSpin.Web

# 1) Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# copy project files to leverage layer caching on restore
COPY OneMoreSpin.sln ./
COPY OneMoreSpin.Model/OneMoreSpin.Model.csproj OneMoreSpin.Model/
COPY OneMoreSpin.DAL/OneMoreSpin.DAL.csproj OneMoreSpin.DAL/
COPY OneMoreSpin.Services/OneMoreSpin.Services.csproj OneMoreSpin.Services/
COPY OneMoreSpin.ViewModels/OneMoreSpin.ViewModels.csproj OneMoreSpin.ViewModels/
COPY OneMoreSpin.Web/OneMoreSpin.Web.csproj OneMoreSpin.Web/

RUN dotnet restore OneMoreSpin.Web/OneMoreSpin.Web.csproj

COPY . .

RUN dotnet publish OneMoreSpin.Web/OneMoreSpin.Web.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://0.0.0.0:5046
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5046

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "OneMoreSpin.Web.dll"]

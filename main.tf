terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.1.0"
    }
  }
  
}

provider "azurerm" {
  resource_provider_registrations = "none" # This is only required when the User, Service Principal, or Identity running Terraform lacks the permissions to register Azure Resource Providers.
  features {}
  subscription_id = "b0005a4d-1791-43c8-930f-538759929700"
}

data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "less-go"
  location = "central india"
}

# --- Networking ---
resource "azurerm_virtual_network" "vnet" {
  name                = "main-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name                 = "internal-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "frontend_pip" {
  name                = "frontend-pip"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  allocation_method   = "Static"
  sku                 = "Standard"
}

# --- Security Groups ---
resource "azurerm_network_security_group" "frontend_nsg" {
  name                = "frontend-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "AllowHTTP"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowSSH"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_security_group" "backend_nsg" {
  name                = "backend-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "AllowFrontend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000" # Assuming NestJS runs on 3000
    source_address_prefix      = "10.0.1.0/24" # Allow from subnet
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_security_group" "db_nsg" {
  name                = "db-nsg"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "AllowBackend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3306"
    source_address_prefix      = "10.0.1.0/24" # Allow from subnet
    destination_address_prefix = "*"
  }
}

# --- Interfaces ---
resource "azurerm_network_interface" "frontend_nic" {
  name                = "frontend-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.frontend_pip.id
  }
}

resource "azurerm_network_interface_security_group_association" "frontend_assoc" {
  network_interface_id      = azurerm_network_interface.frontend_nic.id
  network_security_group_id = azurerm_network_security_group.frontend_nsg.id
}

resource "azurerm_network_interface" "backend_nic" {
  name                = "backend-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_network_interface_security_group_association" "backend_assoc" {
  network_interface_id      = azurerm_network_interface.backend_nic.id
  network_security_group_id = azurerm_network_security_group.backend_nsg.id
}

resource "azurerm_network_interface" "db_nic" {
  name                = "db-nic"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_network_interface_security_group_association" "db_assoc" {
  network_interface_id      = azurerm_network_interface.db_nic.id
  network_security_group_id = azurerm_network_security_group.db_nsg.id
}

# --- Storage & Key Vault ---
resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "azurerm_storage_account" "sa" {
  name                     = "mystorage${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_container" "sc" {
  name                  = "public-files"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "blob"
}

resource "azurerm_key_vault" "kv" {
  name                        = "mykv${random_string.suffix.result}"
  location                    = azurerm_resource_group.rg.location
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }
}

# --- Secrets ---
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "_%@"
}

resource "azurerm_key_vault_secret" "db_pass" {
  name         = "DB-PASSWORD"
  value        = random_password.db_password.result
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_key_vault_secret" "storage_url" {
  name         = "STORAGE-URL"
  value        = azurerm_storage_account.sa.primary_blob_endpoint
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_key_vault_secret" "db_host" {
  name         = "DB-HOST"
  value        = azurerm_network_interface.db_nic.private_ip_address
  key_vault_id = azurerm_key_vault.kv.id
}

# --- ACR ---
resource "azurerm_container_registry" "acr" {
  name                = "myacr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# --- VMs ---

# Frontend VM
resource "azurerm_linux_virtual_machine" "frontend" {
  name                = "frontend-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.frontend_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  custom_data = base64encode(<<-EOF
    #cloud-config
    package_upgrade: true
    packages:
      - docker.io
      - docker-compose
      - curl
    runcmd:
      - systemctl start docker
      - systemctl enable docker
      - usermod -aG docker adminuser
      - curl -sL https://aka.ms/InstallAzureCLIDeb | bash
    EOF
  )

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  identity {
    type = "SystemAssigned"
  }
}

# Backend VM
resource "azurerm_linux_virtual_machine" "backend" {
  name                = "backend-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.backend_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  custom_data = base64encode(<<-EOF
    #cloud-config
    package_upgrade: true
    packages:
      - docker.io
      - docker-compose
      - curl
    runcmd:
      - systemctl start docker
      - systemctl enable docker
      - usermod -aG docker adminuser
      - curl -sL https://aka.ms/InstallAzureCLIDeb | bash
    EOF
  )

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  identity {
    type = "SystemAssigned"
  }
}

# DB VM
resource "azurerm_linux_virtual_machine" "db" {
  name                = "db-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_B1s"
  admin_username      = "adminuser"
  network_interface_ids = [
    azurerm_network_interface.db_nic.id,
  ]

  admin_ssh_key {
    username   = "adminuser"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  custom_data = base64encode(<<-EOF
    #cloud-config
    package_upgrade: true
    packages:
      - docker.io
      - docker-compose
      - curl
    runcmd:
      - systemctl start docker
      - systemctl enable docker
      - usermod -aG docker adminuser
      - curl -sL https://aka.ms/InstallAzureCLIDeb | bash
    EOF
  )

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

# Access Policies for VMs to KeyVault
resource "azurerm_key_vault_access_policy" "frontend_policy" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_virtual_machine.frontend.identity[0].principal_id
  secret_permissions = ["Get"]
}

resource "azurerm_key_vault_access_policy" "backend_policy" {
  key_vault_id = azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_virtual_machine.backend.identity[0].principal_id
  secret_permissions = ["Get"]
}

resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_virtual_machine.frontend.identity[0].principal_id
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_virtual_machine.backend.identity[0].principal_id
}
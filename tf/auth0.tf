resource "auth0_tenant" "tenant_config" {
  friendly_name = "Anonymous Sign-Up Playground"
  flags {
    enable_client_connections = false
  }
  sandbox_version = "18"
}

resource "auth0_connection" "anon-db" {
  name     = "anon-db"
  strategy = "auth0"


  options {
    import_mode                    = false
    enabled_database_customization = true
    brute_force_protection         = true

    custom_scripts = {
      get_user = file("../custom-db/get_user.js")
      login = file("../custom-db/login.js")
      create = file("../custom-db/create.js")
    }

    configuration = {
      SHARED_SECRET = var.shared_secret
    }
  }
}

resource "auth0_client" "jwt_io" {
  name            = "JWT.io"
  description     = "JWT.io Test Client"
  app_type        = "spa"
  oidc_conformant = true
  is_first_party  = true

  callbacks = [
    "https://jwt.io"
  ]

  grant_types = [
    "implicit",
    "password",
    "http://auth0.com/oauth/grant-type/password-realm",
    "authorization_code"
  ]

  jwt_configuration {
    alg = "RS256"
  }
}

resource "auth0_connection_clients" "db-clients" {
  connection_id   = auth0_connection.anon-db.id
  enabled_clients = [
    auth0_client.jwt_io.id,
    var.auth0_tf_client_id,
  ]
  lifecycle {
    ignore_changes = [
      enabled_clients
    ]
  }
}


output "client_id" {
  value = auth0_client.jwt_io.client_id
}
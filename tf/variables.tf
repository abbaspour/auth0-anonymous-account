## cloudflare
variable "cloudflare_email" {
  type        = string
  description = "Cloudflare account email"
}

variable "cloudflare_api_key" {
  type        = string
  description = "Cloudflare API key"
  sensitive   = true
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "cloudflare zone id"
}

variable "cloudflare_workers_domain" {
  type        = string
  description = "workers domain"
}

variable "cloudflare_token" {
  type = string
  description = "token to read query WAE over SQL"
  sensitive = true
}

variable "deployment_top_domain" {
  type = string
  description = "top domain name of deployment"
}

variable "deployment_sub_domain" {
  type = string
  description = "subdomain name of deployment"
}

## auth0
variable "auth0_domain" {
  type = string
  description = "auth0 domain"
}

variable "auth0_tf_client_id" {
  type = string
  description = "Auth0 TF provider client_id"
}

variable "auth0_tf_client_secret" {
  type = string
  description = "Auth0 TF provider client_secret"
  sensitive = true
}

variable "shared_secret" {
  type = string
  description = "shared secret between Cloudflare and Auth0"
  sensitive = true
}
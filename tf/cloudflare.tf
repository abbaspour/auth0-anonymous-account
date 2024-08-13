# configure worker to proxy auth0 routes
resource "cloudflare_workers_script" "router" {
  name       = "${var.deployment_sub_domain}-router"
  content = file("../worker/src/index.mjs")
  account_id = var.cloudflare_account_id
  module     = true
  compatibility_flags = [
    "nodejs_compat"
  ]
  compatibility_date = "2024-08-12"

  lifecycle {
    ignore_changes = [
      content,         # because we deploy with wrangler
      plain_text_binding
    ]
  }

}

locals {
  deployment_fqdn = "${var.deployment_sub_domain}.${var.deployment_top_domain}"
}
# set worker to proxy auth0 routes
resource "cloudflare_workers_route" "route" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "${local.deployment_fqdn}/*"
  script_name = cloudflare_workers_script.router.name
}

# add an auth0 CNAME record to the owner zone
resource "cloudflare_record" "router_cname" {
  zone_id = var.cloudflare_zone_id
  name    = var.deployment_sub_domain
  type    = "CNAME"
  content = "${cloudflare_workers_script.router.name}.${var.cloudflare_workers_domain}"
  proxied = true
  ttl     = 1
}

output "index-page" {
  value = "https://${local.deployment_fqdn}/index.html"
}

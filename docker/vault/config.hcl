backend "file" {
  path = "/vault/file"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_cert_file = "/vault/ssl/ca.crt"
  tls_key_file = "/vault/ssl/ca.key"
}

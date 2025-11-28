#!/bin/sh
source .venv/bin/activate
odoo-bin server --http-port "$1"

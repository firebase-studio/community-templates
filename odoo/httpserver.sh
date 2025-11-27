#!/bin/bash
source .venv/bin/activate
odoo-bin --config odoo.conf --http-port $1

#!/bin/bash
set -e
source .venv/bin/activate
python -m pip install --upgrade pip
sed -i '/^python-ldap==/d' .idx/.data/odoo/requirements.txt
python -m pip install -r .idx/.data/odoo/requirements.txt
python -m pip install urllib3 werkzeug num2words pytz passlib
mkdir -p /home/user/odoo/custom_addons
touch odoo.conf
odoo-bin --save --stop-after-init --config odoo.conf
sed -i \
    -e "/^addons_path =/ s/$/,\/home\/user\/odoo\/custom_addons/" \
    -e "s/.local\/share\/Odoo/odoo\/.idx\/.data\/odoo-data/g" \
    odoo.conf
odoo-bin --config odoo.conf --http-port $1

# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    $PACKAGES
  ];
  # Sets environment variables in the workspace
  env = { };
  services.postgres = {
    enable = true;
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "ms-python.python"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["sh" "httpserver.sh" "$PORT"];
          manager = "web";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        odoo-install = ''
          python -m venv .venv
          ln -s /home/user/$WS_NAME/.idx/.data/odoo/odoo-bin .venv/bin/odoo-bin
          ln -s /usr/lib/libldap.so .venv/lib/libldap_r.so
          source .venv/bin/activate
          sed -i '/^python-ldap==/d' .idx/.data/odoo/requirements.txt
          NIX_LDFLAGS="$NIX_LDFLAGS -L$VIRTUAL_ENV/lib" pip install -r .idx/.data/odoo/requirements.txt
          python -m pip install urllib3 werkzeug num2words pytz passlib
          
          odoo-bin --save --stop-after-init
          mv ../.odoorc odoo.conf
          sed -i                                                                 \
              -e "/^addons_path =/ s/\$/,\/home\/user\/$WS_NAME\/custom_addons/" \
              -e "s/.local\/share\/Odoo/$WS_NAME\/.idx\/.data\/odoo-data/g"      \
              odoo.conf
        '';
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "README.md" ];
      };
    };
  };
}

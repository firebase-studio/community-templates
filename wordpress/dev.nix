# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ config, lib, pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.wordpress
    pkgs.sqlite
    pkgs.git
    pkgs.wp-cli
  ];

  # Sets environment variables in the workspace
  env = {
    WORDPRESS_DB_NAME = "wordpress";
    WORDPRESS_DB_USER = "example username";
    WORDPRESS_DB_PASSWORD = "example password";
  };

  services = { };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["wp" "server" "--port=$PORT" "--host=0.0.0.0"];
          manager = "web";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        default.openFiles = [ ".idx/dev.nix" "README.md" ];
      };
      # Runs when the workspace is (re)started
      onStart = {
        start-server = "wp server --port=$PORT --host=0.0.0.0";
      };
    };
  };
}

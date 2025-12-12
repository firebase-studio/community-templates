# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        server-npm-install = "cd server && npm ci --no-audit --prefer-offline --no-progress --timing";
        client-npm-install = "cd client && npm ci --no-audit --prefer-offline --no-progress --timing";
        default.openFiles = ["README.md" "client/src/App.jsx" "client/src/App.tsx"];
      };
      # Runs when a workspace is (re)started
      onStart= {
        run-server = "cd server && npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          cwd = "client";
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          manager = "web";
        };
      };
    };
  };
}
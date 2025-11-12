# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05" ; #or "unstable" ;
  # Use https://search.nixos.org/packages to find packages
  packages = [
    # pkgs.go
    # pkgs.python311
    # pkgs.python311Packages.pip
    # pkgs.nodejs_20
    # pkgs.nodePackages.nodemon
    pkgs.python314
    pkgs.uv
    pkgs.pipx
    pkgs.nodejs_24
  ];
  # Sets environment variables in the workspace
  env = {
    VITE_API_URL = "https://8000-$WEB_HOST";
    BACKEND_CORS_ORIGINS = "https://8000-$WEB_HOST";
    FRONTEND_HOST = "https://9000-$WEB_HOST";
    DOMAIN = "https://9000-$WEB_HOST";
  };
  services.docker.enable = true;
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
          # and show it in IDX's web preview panel
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
          cwd = "my-awesome-project/frontend";
          env = {
            # Environment variables to set for your server
            PORT = "$PORT";
          };
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Example: install JS dependencies from NPM
        npm-install = "cd my-awesome-project/frontend/ && npm ci --no-audit --prefer-offline --no-progress --timing";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ ".idx/dev.nix" "README.md" ];
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Example: start a background task to watch and re-build backend code
        start-db = "cd my-awesome-project && docker compose up db prestart";
        start-backend = "cd my-awesome-project/backend/ && uv sync && source .venv/bin/activate && fastapi dev app/main.py";
        run-tests = "cd my-awesome-project/backend/ && uv sync && source .venv/bin/activate && ./scripts/test.sh";
        # run-smoke = "curl http://localhost:8000/api/v1/utils/health-check/";
      };
    };
  };
}
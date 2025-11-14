{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.python314
    pkgs.python313Packages.pip
    pkgs.python313Packages.fastapi
    pkgs.python313Packages.uvicorn
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "./devserver.sh" ];
          env = { PORT = "$PORT"; };
          manager = "web";
        };
      };
    };
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [ "ms-python.python" "rangav.vscode-thunder-client" ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install =
          "python -m venv .venv && source .venv/bin/activate &&  pip install -r requirements.txt";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "app.py" ];
      };
    };
  };
}

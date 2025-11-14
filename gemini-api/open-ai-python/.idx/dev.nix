# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.python313
    pkgs.python313Packages.pip
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "ms-python.python"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        create-venv = ''
          # Always start fresh
          rm -rf .venv
          python3 -m venv .venv
          source .venv/bin/activate
          pip install --upgrade -r requirements.txt
        '';
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "main.py" ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
  };
}

# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_24
    pkgs.jdk17
  ];
  # Sets environment variables in the workspace
  env = { };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [ 
        "nrwl.angular-console"
        "esbenp.prettier-vscode"
        "firsttris.vscode-jest-runner"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        install = ''
          npm ci --prefer-offline --no-audit --no-progress --timing
          yes | npx ns preview'';
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "app/app.js" ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    # previews = {
    #   enable = true;
    #   previews = {
    #     web = {
    #       command =
    #         [ "ns" "preview" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
    #       manager = "web";
    #     };
    #   };
    # };
  };
}

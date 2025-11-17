
{ pkgs, ... }: {
  packages = [
    pkgs.go
  ];
  bootstrap = ''
    # Create output directory and immediately grant write permissions
    mkdir "$out"
    chmod +w "$out"

    # Copy the entire contents of the 'dev' directory.
    cp -r ${./dev}/. "$out"

    # Recursively grant write permissions to all copied files and directories.
    chmod -R +w "$out"

    # Change into the new project directory.
    cd "$out"

    # Remove the template's go.mod to avoid conflict with 'go mod init'.
    rm -f go.mod go.sum

    # Initialize a new go module using the parameter from idx-template.json.
    # We assign it to a shell variable to make the script more robust.
    MODULE_NAME="{{.module}}"
    go mod init "$MODULE_NAME"

    # Tidy the dependencies.
    go mod tidy
  '';
}

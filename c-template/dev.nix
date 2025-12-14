{ pkgs, ... }: {
  # Choose a stable channel
  channel = "stable-23.11"; 
  
  # Install GCC, Make, and GDB (debugger)
  packages = [
    pkgs.gcc
    pkgs.gnumake
    pkgs.gdb
  ];

  idx = {
    # Install the official C/C++ extension for VS Code
    extensions = [
      "ms-vscode.cpptools"
      "ms-vscode.cpptools-extension-pack"
    ];
    
    workspace = {
      onCreate = {
        # Optional: Compile the project automatically when the workspace is created
        build = "make"; 
      };
    };
  };
}
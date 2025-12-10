package main

import (
	"log"
	"os"
	"strconv"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	var hooksDir string = os.Getenv("PB_HOOKS_DIR")
	var hooksWatch bool = true
	var hooksPool int = 25
	var migrationsDir string
	var automigrate bool = true
	var publicDir string = "./pb_public"
	var indexFallback bool = true
	var queryTimeout int = 30

	if os.Getenv("PB_HOOKS_DIR") != "" {
		hooksDir = os.Getenv("PB_HOOKS_DIR")
	}

	if os.Getenv("PB_HOOKS_WATCH") != "" {
		value, err := strconv.ParseBool(os.Getenv("PB_HOOKS_WATCH"))
		if err != nil {
			hooksWatch = value
		}
	}

	if os.Getenv("PB_HOOKS_POOL") != "" {
		value, err := strconv.Atoi(os.Getenv("PB_HOOKS_POOL"))
		if err == nil {
			hooksPool = value
		}
	}

	if os.Getenv("PB_AUTO_MIGRATE") != "" {
		value, err := strconv.ParseBool(os.Getenv("PB_AUTO_MIGRATE"))
		if err != nil {
			automigrate = value
		}
	}

	if os.Getenv("PB_PUBLIC_DIR") != "" {
		publicDir = os.Getenv("PB_PUBLIC_DIR")
	}

	if os.Getenv("PB_INDEX_FALLBACK") != "" {
		value, err := strconv.ParseBool(os.Getenv("PB_INDEX_FALLBACK"))
		if err != nil {
			indexFallback = value
		}
	}

	if os.Getenv("PB_QUERY_TIMEOUT") != "" {
		value, err := strconv.Atoi(os.Getenv("PB_QUERY_TIMEOUT"))
		if err == nil {
			queryTimeout = value
		}
	}

	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: migrationsDir,
		HooksDir:      hooksDir,
		HooksWatch:    hooksWatch,
		HooksPoolSize: hooksPool,
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})

	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	app.OnBootstrap().BindFunc(func(e *core.BootstrapEvent) error {
		if err := e.Next(); err != nil {
			return err
		}
		log.Println("Custom logic executed during application bootstrap!")
		e.App.Settings().Batch.Timeout = int64(queryTimeout) //time.Duration(int64(queryTimeout)) * time.Second
		return nil
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.GET("/", apis.Static(os.DirFS(publicDir), indexFallback))
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

# FastAPI Full Template bootstrap for Project IDX

- [Project IDX](https://developers.google.com/idx): A cloud-based development environment by Google that offers a browser-first workspace for coding, featuring built-in AI assistance and seamless integration with development tools
- [FastAPI Full Template](https://fastapi.tiangolo.com/project-generation/): A production-ready project generator for FastAPI applications that includes user management, authentication, SQLAlchemy models, and Docker configuration out of the box

## Dependencies

The project requires:
- Python 3.x
- FastAPI
- Docker and Docker Compose
- PostgreSQL

## Installation
<a href="https://studio.firebase.google.com/new?template=https://github.com/project-idx/community-templates/tree/main/full-stack-fastapi-template">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://cdn.firebasestudio.dev/btn/open_dark_32.svg">
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://cdn.firebasestudio.dev/btn/open_light_32.svg">
    <img
      height="32"
      alt="Open in Firebase Studio"
      src="https://cdn.firebasestudio.dev/btn/open_blue_32.svg">
  </picture>
</a>

## Configuration

By default the [Copier](https://copier.readthedocs.io/) will execute with default values:

```bash
test-fastapi-full-6064653:~/test-fastapi-full$ pipx run copier copy https://github.com/fastapi/full-stack-fastapi-template my-awesome-project --trust
🎤 The name of the project, shown to API users (in .env)
   FastAPI Project
🎤 The name of the stack used for Docker Compose labels (no spaces) (in .env)
   fastapi-project
🎤 'The secret key for the project, used for security,
stored in .env, you can generate one with:
python -c "import secrets; print(secrets.token_urlsafe(32))"'
   changethis
🎤 The email of the first superuser (in .env)
   admin@example.com
🎤 The password of the first superuser (in .env)
   changethis
🎤 The SMTP server host to send emails, you can set it later in .env
 
🎤 The SMTP server user to send emails, you can set it later in .env
 
🎤 The SMTP server password to send emails, you can set it later in .env
 
🎤 The email account to send emails from, you can set it later in .env
   info@example.com
🎤 'The password for the PostgreSQL database, stored in .env,
you can generate one with:
python -c "import secrets; print(secrets.token_urlsafe(32))"'
   changethis
🎤 The DSN for Sentry, if you are using it, you can set it later in .env
```

## Known Issues

Note: In order to allow the frontend to talk to the backend the backend port must be made [**Public**](https://community.idx.dev/t/early-preview-of-public-ports/1911). Why? Dunno. 

![image.png](image.png)

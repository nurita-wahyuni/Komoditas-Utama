
import passlib.handlers.bcrypt
import bcrypt

# Monkey patch passlib to fix compatibility with bcrypt >= 4.0.0
# Issue: passlib tries to access bcrypt.__about__.__version__ which was removed
if not hasattr(bcrypt, '__about__'):
    class MockAbout:
        __version__ = bcrypt.__version__
    bcrypt.__about__ = MockAbout()

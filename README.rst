django-react-hybrid
================

 Django boilerplate for projects that want to render
 templates and React components interchangebly.

.. image:: https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg
     :target: https://github.com/pydanny/cookiecutter-django/
     :alt: Built with Cookiecutter Django
.. image:: https://img.shields.io/badge/code%20style-black-000000.svg
     :target: https://github.com/ambv/black
     :alt: Black code style


:License: MIT

Getting Started
--------

::

git clone https://github.com/tylerhuntington222/django-react-hybrid.git

Create a Python (>3.6) virtual environment using your CLI of choice and
activate it.

::

pip install -r requirements.txt

Make sure you have `Node.js and npm`_. installed
..https://www.npmjs.com/get-npm

.. _ `Node.js and npm: https://www.npmjs.com/get-npm`

::

$ cd frontend
$ npm install

To watch and hot-reload JSX in the `frontend/src` directory during development,
use the following command (executed from within the `frontend` directory):

::

$ npm run watch

To start up Django's development server, use the following command (executed
from the root project directory):

::

./manage.py runserver



Configurations
--------

For configuration options, refer to the settings_. section of the Django
Cookiecutter docs.

.. _settings: http://cookiecutter-django.readthedocs.io/en/latest/settings.html

Basic Commands
--------------

User Accounts
^^^^^^^^^^^^^^^^^^^^^
By default, this app uses Django's built in user authentication system.

* To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

* To create an **superuser account**, use this command::

    $ python manage.py createsuperuser

For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

Type checks
^^^^^^^^^^^

Running type checks with mypy:

::

  $ mypy django_react_pac

Test coverage
^^^^^^^^^^^^^

To run the tests, check your test coverage, and generate an HTML coverage report::

    $ coverage run -m pytest
    $ coverage html
    $ open htmlcov/index.html

Running tests with py.test
~~~~~~~~~~~~~~~~~~~~~~~~~~

::

  $ pytest

Live reloading and Sass CSS compilation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Moved to `Live reloading and SASS compilation`_.

.. _`Live reloading and SASS compilation`: http://cookiecutter-django.readthedocs.io/en/latest/live-reloading-and-sass-compilation.html



Celery
^^^^^^

This app comes with Celery.

To run a celery worker:

.. code-block:: bash

    cd django_react_pac
    celery -A config.celery_app worker -l info

Please note: For Celery's import magic to work, it is important *where* the celery commands are run. If you are in the same folder with *manage.py*, you should be right.





Deployment
----------

The following details how to deploy this application.


Heroku
^^^^^^

See detailed `cookiecutter-django Heroku documentation`_.

.. _`cookiecutter-django Heroku documentation`: http://cookiecutter-django.readthedocs.io/en/latest/deployment-on-heroku.html



Docker
^^^^^^

See detailed `cookiecutter-django Docker documentation`_.

.. _`cookiecutter-django Docker documentation`: http://cookiecutter-django.readthedocs.io/en/latest/deployment-with-docker.html




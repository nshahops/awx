# Python
import logging
import urlparse

# Django
from django.core.validators import URLValidator
from django.utils.translation import ugettext_lazy as _

# Django REST Framework
from rest_framework.fields import *  # noqa

logger = logging.getLogger('awx.conf.fields')

# Use DRF fields to convert/validate settings:
# - to_representation(obj) should convert a native Python object to a primitive
#   serializable type. This primitive type will be what is presented in the API
#   and stored in the JSON field in the datbase.
# - to_internal_value(data) should convert the primitive type back into the
#   appropriate Python type to be used in settings.


class StringListField(ListField):
    child = CharField()


class URLField(CharField):

    def __init__(self, **kwargs):
        schemes = kwargs.pop('schemes', None)
        self.allow_plain_hostname = kwargs.pop('allow_plain_hostname', False)
        super(URLField, self).__init__(**kwargs)
        validator_kwargs = dict(message=_('Enter a valid URL'))
        if schemes is not None:
            validator_kwargs['schemes'] = schemes
        self.validators.append(URLValidator(**validator_kwargs))

    def to_representation(self, value):
        if value is None:
            return ''
        return super(URLField, self).to_representation(value)

    def run_validators(self, value):
        if self.allow_plain_hostname:
            try:
                url_parts = urlparse.urlsplit(value)
                if url_parts.hostname and '.' not in url_parts.hostname:
                    netloc = '{}.local'.format(url_parts.hostname)
                    if url_parts.port:
                        netloc = '{}:{}'.format(netloc, port)
                    if url_parts.username:
                        if url_parts.password:
                            netloc = '{}:{}@{}' % (url_parts.username, url_parts.password, netloc)
                        else:
                            netloc = '{}@{}' % (url_parts.username, netloc)
                    value = urlparse.urlunsplit([url_parts.scheme, netloc, url_parts.path, url_parts.query, url_parts.fragment])
            except:
                raise  # If something fails here, just fall through and let the validators check it.
        super(URLField, self).run_validators(value)

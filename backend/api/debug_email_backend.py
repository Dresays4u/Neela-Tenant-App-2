import smtplib
from django.core.mail.backends.smtp import EmailBackend

class DebugEmailBackend(EmailBackend):
    def open(self):
        """
        Ensures we have a connection to the email server. Returns whether a
        new connection was created (or False if it already existed).
        """
        if self.connection:
            # Nothing to do if the connection is already open.
            return False

        try:
            self.connection = smtplib.SMTP(self.host, self.port,
                                           local_hostname=self.local_hostname,
                                           timeout=self.timeout)
            
            # Force debug output to stdout
            self.connection.set_debuglevel(2)
            
            if self.use_tls:
                self.connection.starttls(keyfile=self.ssl_keyfile,
                                         certfile=self.ssl_certfile)
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except OSError:
            if not self.fail_silently:
                raise


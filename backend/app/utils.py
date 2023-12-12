import time

class TimeStats():
    def __init__(self):
        # ttfb -> Time to first byte
        self.start_time = time.time()
        self.language_ttfb = None
        self.speech_ttfb = None
    def end_language(self):
        if self.language_ttfb is None:
            self.language_ttfb = time.time()

    def end_speech(self):
        if self.speech_ttfb is None:
            self.speech_ttfb = time.time()

    def get_language_ttfb(self):
        return self.language_ttfb - self.start_time
    def get_speech_ttfb(self):
        if self.speech_ttfb is None:
            return 0
        return self.speech_ttfb - self.language_ttfb


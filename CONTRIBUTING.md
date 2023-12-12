# Contributing
We appreciate your contributions!

## Process
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Contribution Ideas
- **Adding an open source text to speech model**:  The project currently relies on OpenAI's TTS system. Adding a good open source TTS model like Suno Bark that can stream audio output would be cool.
- **Image frame optimization in the prompt**: The project currently collects frames every 2s and uses the last n_frames to pass as input to the model. But not all frames are equally useful, would be cool to collate only useful frames by doing similarity embedding and filtering out irrelevant ones from context
- **Add a global hotkey to trigger the model**: Project currently uses VAD to detect silence and triggers the vision model. That doesn't work very well in a noisy area like in a cafe. Having a global hotkey to trigger the vision model would give us more control and reduce latency too.

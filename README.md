# cyber-system-stats
A little package that displays system information.

![Demo](/demo.png)

Install with `npm i -g cyber-system-stats`

## Usage
Run `systemstats` to see the system time, uptime, memory, and disk usage.

### Options
* `--storage <path>`: Adds an additional storage meter for `<path>`. This option can be used multiple times.
* `--padding <size>`: Sets the width of the label column to `<size>`, defaults to `24`.
* `--barlength <size>`: Sets the width of bar meters to `<size>`, defaults to `30`.
* `--separate`: Adds blank line separators between sections.
* `--nopublicip`: Skips fetching the public IP from [ipify.org](https://www.ipify.org/).
* `--dtformat <format>`: Sets the format of the date and time to `<format>`. Defaults to `YYYY-MM-DD H:mm:ss`. See [Day.js Format](https://day.js.org/docs/en/display/format) for details.
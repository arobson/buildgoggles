## build-goggles
A way to capture git repository information for CI builds.

### Rationale
Our dev team has the ability to deploy code from all forks and branches. That means we need to include information as part of any build artifact to uniquely identify where a particular build came from. build-goggles is a simple command line utilty that will get 6 pieces of information about a build and write it to a JSON file for use by other processes.

### How build number is calculated
To get a consistent build number without tracking builds in a centralized store, we count the number of commits that have occurred since the latest version was put in place.

### Installation

```bash
npm install buildgoggles -g
```

### Use
Running the command will either write `.buildinfo.json` or exit with a non-zero code.

__If run from the repository__
```bash
buildgoggles
```

__If run outside the repository__
```bash
buildgoggles /path/to/repo
```

__sample output__

> Note: the slug is the abbreviated commit sha

```json
{
	"owner": "arobson",
	"repository": "build-goggles",
	"branch": "master",
	"version": "0.1.0",
	"build": 1,
	"slug": "a1b2c3d4"
}
```

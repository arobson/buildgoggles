## buildgoggles
A way to capture git repository information for CI builds in Drone.

### Rationale
Our dev team has the ability to deploy code from all forks and branches. That means we need to include information as part of any build artifact to uniquely identify where a particular build came from. buildgoggles is a simple command line utilty that will get 6 pieces of information about a build and write it to a JSON file for use by other processes.

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

### Command Line Flags
To add a tag version-only tag, to the set of output, you can specify the fork and branch names that are used for "official release". The values for these flags are case-insensitive.

```bash
buildgoggles --releaseOwner=MyCompany --releaseBranch=master
```

### Output

> Note: the slug is the abbreviated commit sha

#### Unconditional
__.buildInfo.yml__
```yaml
dockerImage: "your/image:tag"
owner: you
repository: project
branch: develop
version: 0.1.0
build: 1
slug: a1b2c3d4
```

#### Pre-release
__.droneTags.yml__
```yaml
tags:
 - owner_repository_branch_version_build_sha
```

#### Release
__.droneTags.yml__
```yaml
tags:
 - latest
 - version
 - owner_repository_branch_version_build_sha
```



import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

persistent actor {
  include MixinStorage();

  // Retain old stable variables to avoid compatibility error (they are unused but preserved)
  type _OldUserRole = { #admin; #user; #guest };
  type _OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, _OldUserRole>;
  };
  type _OldUserProfile = { name : Text };
  var accessControlState : _OldAccessControlState = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, _OldUserRole>();
  };
  var userProfiles : Map.Map<Principal, _OldUserProfile> = Map.empty<Principal, _OldUserProfile>();

  type Platform = Text;
  type ProjectId = Text;
  type StepName = Text;

  // Social Account Types
  type SocialAccount = {
    id : Text;
    platform : Platform;
    accountName : Text;
    handle : Text;
    connected : Bool;
  };

  module SocialAccount {
    public func compare(a : SocialAccount, b : SocialAccount) : Order.Order {
      Text.compare(a.id, b.id);
    };
  };

  // Project Types
  public type Project = {
    id : ProjectId;
    title : Text;
    niche : Text;
    platform : Platform;
    screenRatio : Text;
    currentStep : StepName;
    status : Text;
    steps : [(StepName, Text)];
    videoFile : ?Storage.ExternalBlob;
    stepFiles : [(StepName, ?Storage.ExternalBlob)];
  };

  type InternalProject = {
    id : ProjectId;
    title : Text;
    niche : Text;
    platform : Platform;
    screenRatio : Text;
    currentStep : StepName;
    status : Text;
    steps : Map.Map<StepName, Text>;
    videoFile : ?Storage.ExternalBlob;
    stepFiles : Map.Map<StepName, ?Storage.ExternalBlob>;
  };

  module Project {
    public func compare(a : Project, b : Project) : Order.Order {
      Text.compare(a.id, b.id);
    };

    public func fromInternal(internalProject : InternalProject) : Project {
      {
        id = internalProject.id;
        title = internalProject.title;
        niche = internalProject.niche;
        platform = internalProject.platform;
        screenRatio = internalProject.screenRatio;
        currentStep = internalProject.currentStep;
        status = internalProject.status;
        steps = internalProject.steps.toArray();
        videoFile = internalProject.videoFile;
        stepFiles = internalProject.stepFiles.toArray();
      };
    };

    public func toInternal(project : Project) : InternalProject {
      {
        id = project.id;
        title = project.title;
        niche = project.niche;
        platform = project.platform;
        screenRatio = project.screenRatio;
        currentStep = project.currentStep;
        status = project.status;
        steps = Map.fromArray<StepName, Text>(project.steps);
        videoFile = project.videoFile;
        stepFiles = Map.fromArray<StepName, ?Storage.ExternalBlob>(project.stepFiles);
      };
    };
  };

  // Persistent storage
  let socialAccounts = Map.empty<Text, SocialAccount>();
  let projects = Map.empty<ProjectId, InternalProject>();

  // Social Account Management
  public func createSocialAccount(account : SocialAccount) : async () {
    if (socialAccounts.containsKey(account.id)) { return };
    socialAccounts.add(account.id, account);
  };

  public query func getSocialAccount(id : Text) : async ?SocialAccount {
    socialAccounts.get(id);
  };

  public func updateSocialAccount(account : SocialAccount) : async () {
    socialAccounts.add(account.id, account);
  };

  public func deleteSocialAccount(id : Text) : async () {
    socialAccounts.remove(id);
  };

  public query func listSocialAccounts() : async [SocialAccount] {
    socialAccounts.values().toArray().sort();
  };

  // Project Management
  public func createProject(project : Project) : async () {
    if (projects.containsKey(project.id)) { return };
    let internalProject = Project.toInternal(project);
    projects.add(project.id, internalProject);
  };

  public query func getProject(id : ProjectId) : async ?Project {
    switch (projects.get(id)) {
      case (null) { null };
      case (?internalProject) { ?Project.fromInternal(internalProject) };
    };
  };

  public func updateProject(project : Project) : async () {
    let internalProject = Project.toInternal(project);
    projects.add(project.id, internalProject);
  };

  public func deleteProject(id : ProjectId) : async () {
    projects.remove(id);
  };

  public query func listProjects() : async [Project] {
    projects.values().map<InternalProject, Project>(Project.fromInternal).toArray().sort();
  };
};

// converts data from facebook's data export format
// to something we can actually use.

/**
 * Converts the given files into usable json. The output format is a mapping from visualization names
 * to the data that the visualization needs, in the format that the visualization needs.
 * @param data a dictionary, mapping filenames to file contents (the files from the JSON dump)
 * @return a mapping from data viz name to data, or false if an error occurred
 */
function etl(data) {
  try {
    return {
      "ads": parse_ads(data["ads"]),
      "apps": parse_apps(data["apps_and_websites"]),
      "comments": parse_comments(data["comments"]),
      "events": parse_events(data["events"]),
      "friends": parse_friends(data["friends"]),
      "groups": parse_groups(data["groups"]),
      "reactions": parse_reactions(data["likes_and_reactions"]),
      "messages": parse_messages(),
    }
  }
  catch (error) {
    console.log(error);
    return false;
  }
}

function parse_ads(data) {
  return {
    "ad_interests": data["ads_interests.json"]["topics"],
    "targeting_advertisers": data["advertisers_who_uploaded_a_contact_list_with_your_information.json"]
        ["custom_audiences"]
  }
}

function parse_apps(data) {
  let installedAppsList = [];
  data["apps_and_websites.json"]["installed_apps"].forEach(function(app) {
    installedAppsList.push(app["name"])
  });
  return installedAppsList;
}

function parse_comments(data) {
  let commentsList = [];
  data["comments.json"]["comments"].forEach(function(comment) {
    commentsList.push({
      "timestamp": comment["timestamp"],
      "comment": comment["data"][0]["comment"]["comment"]
    })
  });
  return commentsList;
}

function parse_events(data) {
  return {
    "hosted": data["your_events.json"]["your_events"],
    "invited": data["event_invitations.json"]["events_invited"],
    "accepted": data["your_event_responses.json"]["event_responses"]["events_joined"],
    "interested": data["your_event_responses.json"]["event_responses"]["events_interested"],
    "declined": data["your_event_responses.json"]["event_responses"]["events_declined"],
  };
}

function parse_friends(data) {
  return {
    "friends": data["friends.json"]["friends"],
    "former_friends": data["removed_friends.json"]["deleted_friends"],
    "requests_you_rejected": data["rejected_friend_requests.json"]["rejected_requests"],
  };
}

function parse_groups(data) {
  return {
    "group_memberships": data["your_group_membership_activity.json"]["groups_joined"]
  }
}

function parse_reactions(data) {
  // Look for the reactions list within the global data object.
  let reactions_list = data["posts_and_comments.json"]["reactions"];
  let cleaned_reactions_list = [];

  // Parse all reactions and store them using the transaction
  reactions_list.forEach(function(reaction) {
    // Parse data into a nice format
    let cleaned_reaction = {
      "timestamp": new Date(reaction["timestamp"] * 1000),
      "reaction": reaction["data"][0]["reaction"]["reaction"]
    };
    cleaned_reactions_list.push(cleaned_reaction)
  });

  return {
    "posts_and_comments": cleaned_reactions_list,
    "pages": data["pages.json"]["page_likes"]
  }
}

function parse_messages(data) {

}



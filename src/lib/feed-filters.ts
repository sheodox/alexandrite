export type FeedType = 'top' | 'community' | 'user';

export interface FilterOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export const NormalFeedTypeOptions = [
	{
		value: 'Posts',
		label: 'Posts'
	},
	{
		value: 'Comments',
		label: 'Comments'
	}
];
export const UserFeedTypeOptions = (isMe: boolean) => {
	const baseTypes = [
		{
			value: 'Overview',
			label: 'Overview'
		},
		{
			value: 'Comments',
			label: 'Comments'
		},
		{
			value: 'Posts',
			label: 'Posts'
		}
	];
	return !isMe
		? baseTypes
		: [
				...baseTypes,
				{
					value: 'Saved',
					label: 'Saved'
				}
		  ];
};

export const SearchTypeOptions = [
	{
		value: 'All',
		label: 'All'
	},
	{
		value: 'Posts',
		label: 'Posts'
	},
	{
		value: 'Comments',
		label: 'Comments'
	},
	{
		value: 'Communities',
		label: 'Communities'
	},
	{
		value: 'Users',
		label: 'Users'
	},
	{
		value: 'Url',
		label: 'URL'
	}
];

export const ListingOptions = (loggedIn: boolean) => [
	{
		value: 'Subscribed',
		label: 'Subscribed',
		disabled: !loggedIn
	},
	{
		value: 'Local',
		label: 'Local'
	},
	{
		value: 'All',
		label: 'All'
	}
];

export const PostSortOptions = [
	{
		value: 'Hot',
		label: 'Hot'
	},
	{
		value: 'Active',
		label: 'Active'
	},
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	},
	{
		value: 'MostComments',
		label: 'Most Comments'
	},
	{
		value: 'NewComments',
		label: 'New Comments'
	},
	{
		value: 'TopHour',
		label: 'Top Hour'
	},
	{
		value: 'TopSixHour',
		label: 'Top Six Hours'
	},
	{
		value: 'TopTwelveHour',
		label: 'Top Twelve Hours'
	},
	{
		value: 'TopDay',
		label: 'Top Day'
	},
	{
		value: 'TopWeek',
		label: 'Top Week'
	},
	{
		value: 'TopMonth',
		label: 'Top Month'
	},
	{
		value: 'TopYear',
		label: 'Top Year'
	},
	{
		value: 'TopAll',
		label: 'Top All Time'
	}
];

export const CommentFeedSortOptions = [
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	},
	{
		value: 'TopHour',
		label: 'Top Hour'
	},
	{
		value: 'TopSixHour',
		label: 'Top Six Hours'
	},
	{
		value: 'TopTwelveHour',
		label: 'Top Twelve Hours'
	},
	{
		value: 'TopDay',
		label: 'Top Day'
	},
	{
		value: 'TopWeek',
		label: 'Top Week'
	},
	{
		value: 'TopMonth',
		label: 'Top Month'
	},
	{
		value: 'TopYear',
		label: 'Top Year'
	},
	{
		value: 'TopAll',
		label: 'Top All Time'
	}
];

export const SearchSortOptions = CommentFeedSortOptions;

export const InboxTypes = [
	{ value: 'Unread', label: 'Unread' },
	{ value: 'All', label: 'All' }
];

export const InboxListings = [
	{ value: 'All', label: 'All' },
	{ value: 'Replies', label: 'Replies' },
	{ value: 'Mentions', label: 'Mentions' },
	{ value: 'Messages', label: 'Messages' }
];
export const InboxSortOptions = [
	{
		value: 'Hot',
		label: 'Hot'
	},
	{
		value: 'Top',
		label: 'Top'
	},
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	}
];

export const CommentSortOptions = [
	{
		value: 'Hot',
		label: 'Hot'
	},
	{
		value: 'Top',
		label: 'Top'
	},
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	}
];

export const UserSortOptions = [
	{
		value: 'New',
		label: 'New'
	},
	{
		value: 'Old',
		label: 'Old'
	},
	{
		value: 'TopHour',
		label: 'Top Hour'
	},
	{
		value: 'TopSixHour',
		label: 'Top Six Hours'
	},
	{
		value: 'TopTwelveHour',
		label: 'Top Twelve Hours'
	},
	{
		value: 'TopDay',
		label: 'Top Day'
	},
	{
		value: 'TopWeek',
		label: 'Top Week'
	},
	{
		value: 'TopMonth',
		label: 'Top Month'
	},
	{
		value: 'TopYear',
		label: 'Top Year'
	},
	{
		value: 'TopAll',
		label: 'Top All Time'
	}
];

package adapters

import (
	"databag/internal/store"
)

// CardAdapter provides type-safe conversion between backend and frontend card types
type FrontendCard struct {
	ID              int    `json:"id"`
	AccountID       string `json:"accountId"`
	GUID            string `json:"guid"`
	Username        string `json:"username"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	Location        string `json:"location"`
	Image           string `json:"image"`
	Seal            string `json:"seal"`
	Version         string `json:"version,omitempty"`
	Node            string `json:"node,omitempty"`
	ProfileRevision int64  `json:"profileRevision"`
	DetailRevision  int64  `json:"detailRevision"`
	Status          string `json:"status"`
	StatusUpdated   int64  `json:"statusUpdated"`
	InToken         string `json:"inToken"`
	OutToken        string `json:"outToken"`
	Notes           string `json:"notes"`
	Created         int64  `json:"created"`
	Updated         int64  `json:"updated"`
}

// AccountInfo provides safe account information for frontend
type AccountInfo struct {
	ID              uint   `json:"id"`
	GUID            string `json:"guid"`
	Username        string `json:"username"`
	Handle          string `json:"handle,omitempty"`
	Disabled        bool   `json:"disabled"`
	Searchable      bool   `json:"searchable"`
	ProfileRevision int64  `json:"profileRevision"`
	ArticleRevision int64  `json:"articleRevision"`
	GroupRevision   int64  `json:"groupRevision"`
	ChannelRevision int64  `json:"channelRevision"`
	CardRevision    int64  `json:"cardRevision"`
	Created         int64  `json:"created"`
	Updated         int64  `json:"updated"`
	MFAEnabled      bool   `json:"mfaEnabled"`
	MFAConfirmed    bool   `json:"mfaConfirmed"`
}

// ToFrontendCard converts backend Card to frontend-safe type
func ToFrontendCard(card *store.Card) *FrontendCard {
	if card == nil {
		return nil
	}

	return &FrontendCard{
		ID:              int(card.ID),
		AccountID:       card.AccountID,
		GUID:            card.GUID,
		Username:        card.Account.Username,
		Name:            card.Name,
		Description:     card.Description,
		Location:        card.Location,
		Image:           card.Image,
		Seal:            card.Seal,
		Version:         card.Version,
		Node:            card.Node,
		ProfileRevision: card.ProfileRevision,
		DetailRevision:  card.DetailRevision,
		Status:          card.Status,
		StatusUpdated:   card.StatusUpdated,
		InToken:         card.InToken,
		OutToken:        card.OutToken,
		Notes:           card.Notes,
		Created:         card.Created,
		Updated:         card.Updated,
	}
}

// ToAccountInfo converts backend Account to frontend-safe type
func ToAccountInfo(account *store.Account) *AccountInfo {
	if account == nil {
		return nil
	}

	return &AccountInfo{
		ID:              account.ID,
		GUID:            account.GUID,
		Username:        account.Username,
		Handle:          account.Handle,
		Disabled:        account.Disabled,
		Searchable:      account.Searchable,
		ProfileRevision: account.ProfileRevision,
		ArticleRevision: account.ArticleRevision,
		GroupRevision:   account.GroupRevision,
		ChannelRevision: account.ChannelRevision,
		CardRevision:    account.CardRevision,
		Created:         account.Created,
		Updated:         account.Updated,
		MFAEnabled:      account.MFAEnabled,
		MFAConfirmed:    account.MFAConfirmed,
	}
}

// GetFrontendCards converts slice of backend Cards to frontend-safe types
func GetFrontendCards(cards []*store.Card) []*FrontendCard {
	frontendCards := make([]*FrontendCard, 0, len(cards))

	for i, card := range cards {
		frontendCards[i] = ToFrontendCard(card)
	}

	return frontendCards
}

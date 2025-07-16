import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDeckModal({ isOpen, onClose }: CreateDeckModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "watchlist",
    isPublic: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDeckMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/decks", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deck created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
      setFormData({
        name: "",
        description: "",
        type: "watchlist",
        isPublic: false,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deck",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck name",
        variant: "destructive",
      });
      return;
    }
    createDeckMutation.mutate(formData);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: "",
      description: "",
      type: "watchlist",
      isPublic: false,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] text-white">
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Deck Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Tech Watchlist"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Deck Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] text-white">
                <SelectItem value="watchlist">Watchlist</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your deck..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-[var(--dekr-muted)]/10 border-[var(--dekr-border)] text-[var(--dekr-muted)] hover:bg-[var(--dekr-muted)]/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createDeckMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

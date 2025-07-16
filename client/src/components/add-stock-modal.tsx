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

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  decks: any[];
}

export default function AddStockModal({ isOpen, onClose, decks }: AddStockModalProps) {
  const [formData, setFormData] = useState({
    symbol: "",
    deckId: "",
    notes: "",
    targetPrice: "",
    stopLoss: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addStockMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/decks/${data.deckId}/stocks`, {
        symbol: data.symbol.toUpperCase(),
        notes: data.notes || null,
        targetPrice: data.targetPrice ? parseFloat(data.targetPrice) : null,
        stopLoss: data.stopLoss ? parseFloat(data.stopLoss) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock added to deck successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onClose();
      setFormData({
        symbol: "",
        deckId: "",
        notes: "",
        targetPrice: "",
        stopLoss: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add stock",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.deckId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    addStockMutation.mutate(formData);
  };

  const handleClose = () => {
    onClose();
    setFormData({
      symbol: "",
      deckId: "",
      notes: "",
      targetPrice: "",
      stopLoss: "",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] text-white">
        <DialogHeader>
          <DialogTitle>Add Stock to Deck</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="symbol">Stock Symbol *</Label>
            <Input
              id="symbol"
              type="text"
              placeholder="e.g., AAPL"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="deckId">Select Deck *</Label>
            <Select value={formData.deckId} onValueChange={(value) => setFormData({ ...formData, deckId: value })}>
              <SelectTrigger className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white">
                <SelectValue placeholder="Choose a deck" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--dekr-card-bg)] border-[var(--dekr-border)] text-white">
                {decks.map((deck) => (
                  <SelectItem key={deck.id} value={deck.id.toString()}>
                    {deck.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add your notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetPrice">Target Price</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                placeholder="$0.00"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white"
              />
            </div>
            <div>
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                type="number"
                step="0.01"
                placeholder="$0.00"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                className="bg-[var(--dekr-dark-bg)] border-[var(--dekr-border)] text-white"
              />
            </div>
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
              disabled={addStockMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {addStockMutation.isPending ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

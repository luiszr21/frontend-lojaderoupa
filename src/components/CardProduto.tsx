import { useState } from "react";
import type { CriarPropostaRequest, Produto } from "../types";
import { api } from "../Services/Api";
import { useAuthStore } from "../stores/authStore";

function formatarPreco(valor: number) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(valor);
}

interface CardProdutoProps {
	produto: Produto;
	detalhe?: string;
}

export default function CardProduto({
	produto,
	detalhe,
}: CardProdutoProps) {
	const token = useAuthStore((state) => state.token);
	const role = useAuthStore((state) => state.role);
	const [detalhesAbertos, setDetalhesAbertos] = useState(false);
	const [mensagem, setMensagem] = useState("");
	const [enviando, setEnviando] = useState(false);
	const [feedback, setFeedback] = useState("");

	async function enviarProposta() {
		const texto = mensagem.trim();

		if (!texto) {
			setFeedback("Escreva sua proposta antes de enviar.");
			return;
		}

		const payload: CriarPropostaRequest = {
			produtoId: produto.id,
			mensagem: texto,
		};

		setEnviando(true);
		setFeedback("");

		try {
			await api.post("/propostas", payload);
			setMensagem("");
			setFeedback("Proposta enviada para o admin com sucesso.");
		} catch {
			setFeedback("Falha ao enviar proposta. Tente novamente.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div className="relative aspect-4/3 overflow-hidden bg-slate-100">
				{produto.imagemUrl ? (
					<img
						src={produto.imagemUrl}
						alt={produto.nome}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center px-6 text-center text-slate-600">
						<div>
							<p className="text-sm font-semibold">Imagem indisponível</p>
						</div>
					</div>
				)}
			</div>

			<div className="space-y-2 px-4 py-4">
				<h3 className="text-2xl font-extrabold leading-tight text-slate-900">
					{produto.nome}
				</h3>
				<p className="text-base font-bold text-slate-900">
					Preço: {formatarPreco(produto.preco)}
				</p>
				<p className="text-sm text-slate-600">
					{detalhe ?? produto.descricao ?? "Coleção atual"}
				</p>
				<button
					type="button"
					onClick={() => setDetalhesAbertos((valorAtual) => !valorAtual)}
					className="mt-2 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-500"
				>
					{detalhesAbertos ? "Ocultar detalhes" : "Ver detalhes"}
					<span aria-hidden="true">→</span>
				</button>

				{detalhesAbertos ? (
					<div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
						<p className="text-sm text-slate-700">
							<strong>Nome:</strong> {produto.nome}
						</p>
						<p className="text-sm text-slate-700">
							<strong>Tamanho:</strong> {produto.tamanho ?? "Nao informado"}
						</p>
						<p className="text-sm text-slate-700">
							<strong>Descricao:</strong> {produto.descricao ?? "Sem descricao"}
						</p>

						{role === "user" && token ? (
							<div className="space-y-2 pt-2">
								<label htmlFor={`proposta-${produto.id}`} className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
									Sua proposta para o admin
								</label>
								<textarea
									id={`proposta-${produto.id}`}
									value={mensagem}
									onChange={(event) => setMensagem(event.target.value)}
									rows={4}
									placeholder="Ex.: Tenho interesse e posso pagar R$ 120."
									className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
								/>
								<button
									type="button"
									onClick={enviarProposta}
									disabled={enviando}
									className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{enviando ? "Enviando..." : "Enviar proposta"}
								</button>
							</div>
						) : null}

						{!token ? (
							<p className="text-xs font-medium text-amber-700">
								Faca login para enviar uma proposta ao admin.
							</p>
						) : null}

						{feedback ? (
							<p className="text-xs font-medium text-slate-700">{feedback}</p>
						) : null}
					</div>
				) : null}
			</div>
		</article>
	);
}
